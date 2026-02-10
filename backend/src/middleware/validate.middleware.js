
import { z } from 'zod';

export const validateRequest = (schema) => async (req, res, next) => {
    try {
        const data = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Replace req properties with validated data (optional, but good for type safety/coercion)
        req.body = data.body;
        req.query = data.query;
        req.params = data.params;


        next();
    } catch (error) {
        next(error);
    }
};

export const validateId = (req, res, next) => {
    // Basic ID validation (adjust regex if UUID is required)
    const { id } = req.params;
    if (!id || (id.length < 5 && isNaN(id))) { // Loose check for now
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
};
