const authMiddleware = require("../middleware/is-auth");
const expect = require("chai").expect;

describe("Auth middleware", () => {
     it("should throw an arrow if no authorization header is present", function () {
          const req = {
               session: {
                    isLoggedIn: false,
               },
          };

          expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not Authenticated");
     });
});
