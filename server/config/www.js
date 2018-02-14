"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var App_1 = __importDefault(require("./App"));
var port = process.env.PORT || 2222;
var app = new App_1.default().app;
app.listen(port, function () { return console.log("Express server listening at " + port); })
    .on('error', function (err) { return console.error(err); });
