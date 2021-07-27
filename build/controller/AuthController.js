"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.authorizeRequest = exports.loginAction = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let users;
const JWT_ACCESS_TOKEN_SECRET = "a7bffd9133b5abc893cfce78c2973a0fcd1a8307dca3334209d4951a53bc0c9b1fd9113ef3b238aaa4297985ba4e4fdee6e7d99d880c2a3ff3c39b16bcd2907a";
const JWT_REFRESH_TOKEN_SECRET = "e3b3c972f17f878e1f14cb1585a18792b48711587b4900afe41ff4a6c812c365e0f2b7278edc41436c9a81723bf7cbee867bfcfc0128fff5edaaac0056a81eb9";
let refreshTokens = [];
function loadUsers() {
    users = [];
    users.push({ name: "anil", password: "anil@123" });
    users.push({ name: "demo", password: "demo@123" });
    users.push({ name: "abc", password: "abc@123" });
}
loadUsers();
exports.loginAction = (req, resp) => {
    console.log("loginAction");
    //validate the credentials
    //generate a JWT token 
    // invalid --return error code
    const reqUser = { name: req.body.name, password: req.body.password };
    console.log(reqUser);
    const user = users.find(item => item.name === reqUser.name && item.password === reqUser.password);
    if (user) {
        const accessToken = jsonwebtoken_1.default.sign(user, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        const refreshToken = jsonwebtoken_1.default.sign(user, JWT_REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        resp.json({ accessToken, refreshToken });
    }
    else {
        resp.sendStatus(401);
    }
};
exports.authorizeRequest = (req, resp, next) => {
    // authorization : Bearer sjgsjfhgsjdgh77657656ggfgfhgfhfh
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.toString().split(' ')[1];
    if (token == null) {
        resp.sendStatus(401);
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Jwt verify error: ", err);
            return resp.sendStatus(403);
        }
        console.log("User logged in: ", user);
        next();
    });
};
exports.refreshToken = (req, resp) => {
    console.log("refreshToken", req.body);
    const refeshToken = req.body.token;
    console.log(refeshToken);
    if (refeshToken == null)
        return resp.sendStatus(401);
    if (!refreshTokens.includes(refeshToken))
        return resp.sendStatus(401);
    jsonwebtoken_1.default.verify(refeshToken, JWT_REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return resp.sendStatus(403);
        }
        const accsessToken = jsonwebtoken_1.default.sign({ name: user.name, password: user.password }, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        return resp.json({ accessToken: accsessToken });
    });
};
