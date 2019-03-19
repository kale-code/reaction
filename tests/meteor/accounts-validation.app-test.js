/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";

// These are client-side only function (???) so they cannot be test from here
describe("Account Registration Validation ", () => {
  describe("username validation ", () => {
    it("should not allow a invalid username of length 3", done => {
      const username = "tn";
      Meteor.call("accounts/validation/username", username, (error, result) => {
        expect(error).to.be.undefined;
        expect(result).to.be.an("object");
        return done();
      });
    });

    it("should allow a username of valid length", done => {
      const username = "tenten";
      Meteor.call("accounts/validation/username", username, (error, result) => {
        expect(error).to.be.undefined;
        expect(result).to.be.true;
        return done();
      });
    });
  });

  describe("email address validation ", () => {
    it("should not allow an invalid email address", function (done) {
      this.timeout(4000);
      const email = "emailwebsite.com";
      Meteor.call("accounts/validation/email", email, false, (error, result) => {
        expect(result).to.be.an("object");
        return done();
      });
    });

    it("should allow a valid email address", done => {
      const email = "email@website.com";
      Meteor.call("accounts/validation/email", email, false, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a blank optional email address", done => {
      const email = "";
      Meteor.call("accounts/validation/email", email, true, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a valid, supplied, optional email address", done => {
      const email = "email@website.com";
      Meteor.call("accounts/validation/email", email, true, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should not allow an invalid, supplied, optional email address", done => {
      const email = "emailwebsite.com";
      Meteor.call("accounts/validation/email", email, true, (error, result) => {
        expect(result).to.be.an("object");
        return done();
      });
    });
  });

  describe("password validation", () => {
    it("should not allow a password under 6 characters in length", done => {
      const password = "abc12";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.an("array");
        const errMessage = result[0];
        expect(errMessage).to.be.an("object");
        expect(errMessage.reason).to.contain("at least 6 characters");
        return done();
      });
    });

    it("should allow a password of exactly 6 characters in length", done => {
      const password = "abc123";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length", done => {
      const password = "abc1234";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length with only uppercase characters", done => {
      const password = "ABC1234";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length uppercase and lower characters", done => {
      const password = "abcABC1234";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });
    it("should allow a password of 6 characters or more in length uppercase, lower, and symbol characters", done => {
      const password = "abcABC1234@#$%^";
      Meteor.call("accounts/validation/password", password, undefined, (error, result) => {
        expect(result).to.be.true;
        return done();
      });
    });
  });
});
