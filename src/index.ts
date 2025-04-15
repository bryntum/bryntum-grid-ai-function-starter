import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import Review from './models/Review';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

const app = express();

// Serve Bryntum Grid files from node_modules
app.use(express.static(path.join(__dirname, '../node_modules/@bryntum/grid')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

app.get('/api/reviews', async(req, res) => {
    try {
        const reviews = await Review.findAll();
        res.status(200).json({
            success : true,
            data    : reviews
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({
                success : false,
                message : 'There was an error fetching the reviews'
            });
    }
});

app.post('/api/review/create', async(req, res) => {
    const { data } = req.body;
    const { id, ...rest } = data[0];
    try {
        const newReview = await Review.create(rest);
        res.status(201).json({
            success : true,
            data    : [newReview]
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : 'There was an error creating the review'
        });
    }
});

app.post('/api/review/update', async(req, res) => {
    const { data } = req.body;
    const { id, ...rest } = data[0];
    try {
        await Review.update(
            { ...rest },
            { where : { id } }
        );
        const updatedReview = await Review.findByPk(id);
        if (!updatedReview) {
            throw new Error('Updated review not found');
        }

        console.log(updatedReview);

        // Get only the changed fields plus id
        const changedFields = Object.keys(rest);
        const responseData = {
            id,
            ...Object.fromEntries(
                Object.entries(updatedReview.dataValues)
                    .filter(([key]) => changedFields.includes(key))
            )
        };

        res.status(201).json({
            success : true,
            data    : [responseData]
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : 'There was an error updating the review'
        });
    }
});

app.post('/api/review/delete', async(req, res) => {
    const { ids } = req.body;
    try {
        await Review.destroy({
            where : {
                id : {
                    [Op.or] : ids
                }
            }
        });
        res.status(200).json({ success : true });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : `There was an error deleting the review${ids.length > 1 ? 's' : ''}`
        });
    }
});

app.listen(port, () =>
    console.log(`
🚀 Server ready at: http://localhost:${port} 
`)
);