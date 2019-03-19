/* eslint prefer-arrow-callback:0 */
import faker from "faker";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Accounts, Products, OrderSearch } from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import {
  buildProductSearch,
  buildProductSearchRecord,
  buildAccountSearchRecord,
  buildAccountSearch
} from "../methods/searchcollections";
import { getResults } from "./searchresults";

Fixtures();

export function createProduct(isVisible = true, title) {
  const productTitle = title || faker.commerce.productName();
  const productSlug = Reaction.getSlug(productTitle);
  const product = {
    ancestors: [],
    shopId: Reaction.getShopId(),
    title: productTitle,
    pageTitle: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    type: "simple",
    vendor: faker.company.companyName(),
    price: {
      range: "24.99",
      min: 24.99,
      max: 24.99
    },
    isLowQuantity: false,
    isSoldOut: false,
    isBackorder: false,
    metafields: [
      {
        key: "Material",
        value: "Canvas"
      },
      {
        key: "Sole",
        value: "Rubber"
      }
    ],
    supportedFulfillmentTypes: ["shipping"],
    hashtags: [],
    isVisible,
    handle: productSlug,
    workflow: {
      status: "new"
    }
  };
  const insertedProduct = Products.insert(product);
  return insertedProduct;
}

function createAccount() {
  const account = Factory.create("account");
  return account;
}


describe("Search results", () => {
  let product;

  before(() => {
    buildProductSearch();
  });

  beforeEach(() => {
    const productId = createProduct(true, "Product Search Test");
    buildProductSearchRecord(productId);
    product = Products.findOne(productId);
  });

  describe("product search", () => {
    it("should produce at least one result for title match", () => {
      const searchTerm = "Product Search Test";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results which are case insensitive", () => {
      const searchTerm = "pRoDuCt SeArCh tEsT";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results on partial matches", () => {
      const searchTerm = "Product";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce no results for phony title match", () => {
      const searchTerm = "xxxxx";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });

    it("should not show hidden product when you are not an admin", () => {
      const productId = createProduct(false, "isINVisible");
      buildProductSearchRecord(productId);
      product = Products.findOne(productId);
      const searchTerm = product.title;
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });
  });
});

describe("Account Search results", () => {
  let account;
  let sandbox;

  before(() => {
    buildAccountSearch();
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    account = createAccount();
    Accounts.update({ _id: account._id }, {
      $set: {
        "emails.0.address": "matchemail@searchtest.com"
      }
    });
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(account._id, ["forceIndex"]);
  });

  afterEach(() => {
    Accounts.remove({});
    sandbox.restore();
  });

  describe("account search", () => {
    it("should match accounts when searching by email", () => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const results = getResults.accounts("matchemail@searchtest.com");
      expect(results.count()).to.equal(1);
    });

    it("should not return results if not an admin", () => {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const email = account.emails[0].address;
      const results = getResults.accounts(email);
      expect(results).to.be.undefined;
    });
  });
});

describe("Order Search results", () => {
  before(() => {
    OrderSearch.insert({
      shopId: Reaction.getShopId(),
      shippingName: "Ship Name",
      billingName: "Bill Name",
      userEmails: ["test@example.com"]
    });
  });

  after(() => {
    OrderSearch.remove({});
  });

  describe("order search", () => {
    it("should match orders when searching by email", () => {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("test@example.com");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should not return results if not an admin", () => {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => false);
      const results = getResults.orders("test@example.com");
      expect(results).to.be.undefined;
      roleStub.restore();
    });

    it("should return results when searching by shipping name", () => {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("Ship Name");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should return results when searching by billing name", () => {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("Bill Name");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should return results when searching by billing name and be case insensitive", () => {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("biLl nAme");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });
  });
});
