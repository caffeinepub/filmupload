import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Components
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Types
  type FilmId = Nat;
  type Film = {
    id : FilmId;
    title : Text;
    description : Text;
    genre : Text;
    releaseYear : Nat;
    uploadedBy : Principal;
    createdAt : Int;
    poster : Storage.ExternalBlob;
    video : Storage.ExternalBlob;
  };

  module Film {
    public func compareByCreated(film1 : Film, film2 : Film) : Order.Order {
      if (film1.createdAt < film2.createdAt) { #greater } else if (film1.createdAt > film2.createdAt) {
        #less;
      } else { #equal };
    };
  };

  let films = Map.empty<FilmId, Film>();
  var nextFilmId = 1;

  // Functions
  public shared ({ caller }) func uploadFilm(title : Text, description : Text, genre : Text, releaseYear : Nat, poster : Storage.ExternalBlob, video : Storage.ExternalBlob) : async FilmId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload films");
    };

    let filmId = nextFilmId;
    let film : Film = {
      id = filmId;
      title;
      description;
      genre;
      releaseYear;
      uploadedBy = caller;
      createdAt = filmId.toInt();
      poster;
      video;
    };

    films.add(filmId, film);
    nextFilmId += 1;
    filmId;
  };

  public query ({ caller }) func getFilm(id : FilmId) : async Film {
    switch (films.get(id)) {
      case (?film) { film };
      case (null) { Runtime.trap("Film not found") };
    };
  };

  public query ({ caller }) func getAllFilms() : async [Film] {
    films.values().toArray().sort(Film.compareByCreated);
  };

  public shared ({ caller }) func deleteFilm(id : FilmId) : async () {
    let film = switch (films.get(id)) {
      case (?film) { film };
      case (null) { Runtime.trap("Film not found") };
    };

    // Check if caller is uploader or admin
    if (film.uploadedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the uploader or admin can delete this film");
    };

    films.remove(id);
  };

  public query ({ caller }) func getFilmCount() : async Nat {
    films.size();
  };
};
