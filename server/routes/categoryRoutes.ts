import { Router, Request, Response } from 'express';

export const PRODUCT_CATEGORY_CATALOG = [
  { id: 'suits', name: 'Suits', subcategories: ['Suits', 'Dress Suits'] },
  { id: 'blazers-jackets', name: 'Blazers & Jackets', subcategories: ['Blazers', 'Leather Jackets'] },
  { id: 'shirts', name: 'Shirts', subcategories: ['Dress Shirts', 'Polo Shirts'] },
  { id: 'pants', name: 'Pants', subcategories: ['Dress Pants / Pants', 'Jeans'] },
  { id: 'outerwear', name: 'Outerwear', subcategories: ['Coats'] },
  { id: 'sweaters-knitwear', name: 'Sweaters & Knitwear', subcategories: ['Sweaters'] },
  { id: 'footwear', name: 'Footwear', subcategories: ['Shoes', 'Boots'] },
  { id: 'accessories', name: 'Accessories', subcategories: ['Ties'] },
  { id: 'shorts', name: 'Shorts', subcategories: ['Shorts'] }
] as const;

const router = Router();

// Public catalog taxonomy used by storefront filters/navigation and admin product forms.
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: PRODUCT_CATEGORY_CATALOG });
});

router.get('/:categoryId', (req: Request, res: Response) => {
  const category = PRODUCT_CATEGORY_CATALOG.find(c => c.id === req.params.categoryId);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  return res.json({ success: true, data: category });
});

export default router;
