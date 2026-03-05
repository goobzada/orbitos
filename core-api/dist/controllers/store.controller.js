"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const store_service_1 = require("../services/domain/store.service");
class StoreController {
    // --- SETTINGS ---
    static async getSettings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const settings = await store_service_1.StoreService.getStoreSettings(organizationId);
            return res.json(settings);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateSettings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user.id;
            const data = req.body;
            const settings = await store_service_1.StoreService.updateStoreSettings(organizationId, data, userId);
            return res.json(settings);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    // --- PRODUCTS ---
    static async listProducts(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const products = await store_service_1.StoreService.listProducts(organizationId);
            return res.json(products);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async createProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user.id;
            const data = req.body;
            const product = await store_service_1.StoreService.createProduct(organizationId, data, userId);
            return res.status(201).json(product);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const productId = req.params.id;
            const userId = req.user.id;
            const data = req.body;
            const product = await store_service_1.StoreService.updateProduct(organizationId, productId, data, userId);
            return res.json(product);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    static async deleteProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const productId = req.params.id;
            const userId = req.user.id;
            const product = await store_service_1.StoreService.deleteProduct(organizationId, productId, userId);
            return res.json({ success: true, product });
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    // --- ORDERS ---
    static async listOrders(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const orders = await store_service_1.StoreService.listOrders(organizationId);
            return res.json(orders);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // --- PUBLIC ENDPOINTS ---
    static async getPublicProducts(req, res) {
        try {
            const slug = req.params.slug;
            const products = await store_service_1.StoreService.getPublicProducts(slug);
            return res.json(products);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async checkoutPublic(req, res) {
        try {
            const slug = req.params.slug;
            const data = req.body;
            const checkout = await store_service_1.StoreService.createCheckoutSession(slug, data);
            return res.status(201).json(checkout);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.StoreController = StoreController;
