"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var App = /** @class */ (function () {
    function App() {
        this.app = express_1.default();
        this.app.get("/", function (req, res, next) {
            res.send("Hello world");
        });
    }
    App.bootstrap = function () {
        return new App();
    };
    return App;
}());
exports.default = App;
