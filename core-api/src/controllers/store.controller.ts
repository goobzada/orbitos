import { Request, Response } from 'express';
import { StoreService } from '../services/domain/store.service';

export class StoreController {

    // --- SETTINGS ---
    static async getSettings(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const settings = await StoreService.getStoreSettings(organizationId);
            return res.json(settings);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateSettings(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const userId = req.user!.id;
            const data = req.body;
            const settings = await StoreService.updateStoreSettings(organizationId, data, userId);
            return res.json(settings);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    // --- PRODUCTS ---
    static async listProducts(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const products = await StoreService.listProducts(organizationId);
            return res.json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async createProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const userId = req.user!.id;
            const data = req.body;
            const product = await StoreService.createProduct(organizationId, data, userId);
            return res.status(201).json(product);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const productId = req.params.id as string;
            const userId = req.user!.id;
            const data = req.body;
            const product = await StoreService.updateProduct(organizationId, productId, data, userId);
            return res.json(product);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const productId = req.params.id as string;
            const userId = req.user!.id;
            const product = await StoreService.deleteProduct(organizationId, productId, userId);
            return res.json({ success: true, product });
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    // --- ORDERS ---
    static async listOrders(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const orders = await StoreService.listOrders(organizationId);
            return res.json(orders);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    // --- PUBLIC ENDPOINTS ---
    static async getPublicProducts(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const products = await StoreService.getPublicProducts(slug);
            return res.json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async checkoutPublic(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const data = req.body;
            const checkout = await StoreService.createCheckoutSession(slug, data);
            return res.status(201).json(checkout);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
