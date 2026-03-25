import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Authorization/Authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    shippingAddress : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Types
  type ProductData = {
    title : Text;
    description : Text;
    price : Float;
    category : CategoryId;
    image : Storage.ExternalBlob;
    createdAt : Int;
  };

  module ProductData {
    public func compare(a : ProductData, b : ProductData) : Order.Order {
      Float.compare(a.price, b.price);
    };

    // Converts a map of products to a sorted array by price.
    func mapToArray(map : Map.Map<Text, ProductData>) : [ProductData] {
      let array = map.values().toArray();
      array.sort();
    };

    func filterByCategory(products : Map.Map<Text, ProductData>, category : CategoryId) : [ProductData] {
      products.values().toArray().filter(func(product) { product.category == category });
    };
  };

  type Product = ProductData;

  public type ProductInput = {
    title : Text;
    description : Text;
    price : Float;
    category : CategoryId;
    image : Storage.ExternalBlob;
  };

  public type CategoryId = {
    #dress;
    #shoes;
    #accessories;
  };

  public type ProductCategory = {
    #dress;
    #shoes;
    #accessories;
  };

  // Product storage
  let products = Map.empty<Text, ProductData>();

  // CRUD operations for products (admin only)
  public shared ({ caller }) func addProduct(product : ProductInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let newProduct : ProductData = {
      product with
      title = product.title.trim(#char ' ');
      createdAt = Time.now();
    };
    products.add(product.title, newProduct);
  };

  public shared ({ caller }) func updateProduct(id : Text, product : ProductInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?existingProduct) {
        let updatedProduct : ProductData = {
          product with
          title = product.title.trim(#char ' ');
          createdAt = existingProduct.createdAt;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  // Public read access (no authorization required - accessible to all including guests)
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : CategoryId) : async [Product] {
    products.values().toArray().filter(func(product) { product.category == category });
  };

  public query ({ caller }) func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) { product };
    };
  };
};
