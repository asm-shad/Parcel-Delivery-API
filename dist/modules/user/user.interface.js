"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsActive = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SENDER"] = "SENDER";
    UserRole["RECEIVER"] = "RECEIVER";
})(UserRole || (exports.UserRole = UserRole = {}));
var IsActive;
(function (IsActive) {
    IsActive["ACTIVE"] = "ACTIVE";
    IsActive["INACTIVE"] = "INACTIVE";
    IsActive["BLOCKED"] = "BLOCKED";
})(IsActive || (exports.IsActive = IsActive = {}));
