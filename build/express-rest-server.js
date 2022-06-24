"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const product_1 = require("./model/product");
const cors_1 = __importDefault(require("cors"));
const authController = __importStar(require("./controller/AuthController"));
const process_1 = require("process");
const app = express_1.default();
const PORT = process.env.PORT || process_1.argv[2] || 9000;
let products;
let customers;
function load() {
    products = new Array();
    products.push(new product_1.Product(1, "IPhone 12", 80000, "6.1-inch (15.5 cm diagonal) Super Retina XDR display, A14 Bionic chip", "/images/iphone13.png"));
    products.push(new product_1.Product(2, "LG OLED TV", 60000, "4K Ultra HD Smart OLED TV", "/images/lgoled.png"));
    products.push(new product_1.Product(3, "Sony HT-RT3 Real 5.1ch Dolby Digital", 35000, "Soundbar Home Theatre System", "/images/sony.png"));
    products.push(new product_1.Product(4, "Lenovo ThinkPad E470", 88000, "Lenovo ThinkPad E470", "/images/lenovo.png"));
    products.push(new product_1.Product(5, "Logitech headphone 390", 4500, "Headphones", "/images/logitech.png"));
    products.push(new product_1.Product(6, "Amazon Echo Show 10", 7000, "HD smart display with motion, premium sound and Alexa (Black)", "/images/echo.png"));
    products.push(new product_1.Product(7, "Samsung Galaxy Watch 4 Classic", 30000, "With Super AMOLED Display", "/images/watch.png"));
    customers = new Array();
    customers.push({ id: 1, name: "Google", location: "Bangalore" });
    customers.push({ id: 2, name: "Microsoft", location: "Hyderabad" });
    customers.push({ id: 3, name: "Apple", location: "Bangalore" });
    customers.push({ id: 4, name: "Reliance", location: "Mumbai" });
    customers.push({ id: 5, name: "Infosys", location: "Bangalore" });
    customers.push({ id: 6, name: "Tata Motors", location: "Pune" });
    customers.push({ id: 7, name: "Wipro", location: "Bangalore" });
    customers.push({ id: 8, name: "Hyundai", location: "Chennai" });
}
load();
app.use(express_1.default.static('public'));
app.use(body_parser_1.default.json());
//Middleware(intercepts the request==> preprocessing)
app.use((req, resp, next) => {
    console.log(`In middleware ${req.originalUrl} , process id: ${process.pid}`);
    next();
});
//Enable CORS
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use("/secure_products", authController.authorizeRequest);
app.use("/secure_customers", authController.authorizeRequest);
app.post("/login", authController.loginAction);
app.post("/refreshToken", authController.refreshToken);
//GET Product
app.get("/products", (req, resp) => {
    resp.json(products);
});
app.get("/secure_products", (req, resp) => {
    resp.json(products);
});
//GET Product by ID
app.get("/products/:id", (req, resp) => {
    const id = req.params.id;
    if (id) {
        const product = products.find(item => item.id.toString() === id);
        if (product) {
            resp.json(product);
        }
        else {
            resp.status(404).send();
        }
    }
    else {
        resp.status(400).send();
    }
});
//GET Product by ID
app.get("/secure_products/:id", (req, resp) => {
    const id = req.params.id;
    if (id) {
        const product = products.find(item => item.id.toString() === id);
        if (product) {
            resp.json(product);
        }
        else {
            resp.status(404).send();
        }
    }
    else {
        resp.status(400).send();
    }
});
//Update Product
app.put("/products/:id", (req, resp) => {
    // product not found == 404
    // is found and valid ==> update ==> 200
    // invalid ==> 400
    // error ==> 500
    try {
        const id = req.params.id;
        const product = req.body;
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            if (product.id === products[index].id) {
                products[index] = product;
                resp.status(200).send();
            }
            else {
                resp.status(400).send();
            }
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
//Update Product
app.put("/secure_products/:id", (req, resp) => {
    // product not found == 404
    // is found and valid ==> update ==> 200
    // invalid ==> 400
    // error ==> 500
    try {
        const id = req.params.id;
        const product = req.body;
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            if (product.id === products[index].id) {
                products[index] = product;
                resp.status(200).send();
            }
            else {
                resp.status(400).send();
            }
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
//create a new product
app.post("/products", (req, resp) => {
    // Validate the product ==> not valid ==> status: 400(Bad request)
    // Valid product ==> update the data-store => status: 201(Created)
    // Error is saving ==> status: 500(ISR)
    try {
        const product = req.body;
        const index = products.findIndex(item => item.id === product.id);
        if (index === -1) {
            products.push(product);
            resp.status(201);
            resp.end();
        }
        else {
            //No Valid
            resp.status(400).send();
        }
    }
    catch (error) {
        //error
        resp.status(500).send();
    }
});
//create a new product
app.post("/secure_products", (req, resp) => {
    // Validate the product ==> not valid ==> status: 400(Bad request)
    // Valid product ==> update the data-store => status: 201(Created)
    // Error is saving ==> status: 500(ISR)
    try {
        const product = req.body;
        const index = products.findIndex(item => item.id === product.id);
        if (index === -1) {
            products.push(product);
            resp.status(201);
            resp.end();
        }
        else {
            //No Valid
            resp.status(400).send();
        }
    }
    catch (error) {
        //error
        resp.status(500).send();
    }
});
//Delete
app.delete("/products/:id", (req, resp) => {
    //id exists ==> remove status: 200
    // not exist  ==>  status: 404
    // error ==> 500
    const id = req.params.id;
    try {
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            products.splice(index, 1);
            resp.status(200).send();
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
//Delete
app.delete("/secure_products/:id", (req, resp) => {
    //id exists ==> remove status: 200
    // not exist  ==>  status: 404
    // error ==> 500
    const id = req.params.id;
    try {
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            products.splice(index, 1);
            resp.status(200).send();
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
app.get("/customers", (req, resp) => {
    resp.json(customers);
});
app.get("/secure_customers", (req, resp) => {
    resp.json(customers);
});
app.delete("/customers/:id", function (req, resp) {
    console.log("Invoking /customers/" + req.params.id + " DELETE request....");
    var id = parseInt(req.params.id);
    var index = customers.findIndex((cust) => cust.id === id);
    if (index != -1) {
        customers.splice(index, 1);
        resp.json(null);
    }
    else {
        resp.status(404);
        resp.json(null);
    }
});
app.delete("/secure_customers/:id", function (req, resp) {
    console.log("Invoking /customers/" + req.params.id + " DELETE request....");
    var id = parseInt(req.params.id);
    var index = customers.findIndex((cust) => cust.id === id);
    if (index != -1) {
        customers.splice(index, 1);
        resp.json(null);
    }
    else {
        resp.status(404);
        resp.json(null);
    }
});
app.post("/customers", (req, resp) => {
    var customer = req.body;
    try {
        var index = customers.findIndex((cust) => cust.id === req.body.id);
        if (index !== -1) {
            //Bad Request
            resp.status(400);
            resp.json(null);
        }
        else {
            customers.push(customer);
            resp.status(201);
            resp.setHeader("location", "customers/" + customer.id);
            resp.json(null);
        }
    }
    catch (error) {
        resp.status(503);
        resp.json(null);
    }
});
app.put("/customers", function (req, resp) {
    console.log("Invoking /customers PUT request...." + req.body.id);
    var index = customers.findIndex((cust) => cust.id === req.body.id);
    if (index === -1) {
        resp.status(404);
        resp.json(null);
    }
    else {
        console.log(index);
        customers[index] = req.body;
        resp.status(200);
        resp.json(null);
    }
});
app.post("/secure_customers", (req, resp) => {
    var customer = req.body;
    try {
        var index = customers.findIndex((cust) => cust.id === req.body.id);
        if (index !== -1) {
            //Bad Request
            resp.status(400);
            resp.json(null);
        }
        else {
            customers.push(customer);
            resp.status(201);
            resp.setHeader("location", "customers/" + customer.id);
            resp.json(null);
        }
    }
    catch (error) {
        resp.status(503);
        resp.json(null);
    }
});
app.put("/secure_customers", function (req, resp) {
    console.log("Invoking /customers PUT request...." + req.body.id);
    var index = customers.findIndex((cust) => cust.id === req.body.id);
    if (index === -1) {
        resp.status(404);
        resp.json(null);
    }
    else {
        console.log(index);
        customers[index] = req.body;
        resp.status(200);
        resp.json(null);
    }
});
app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT} with process id: ${process.pid}`);
});
