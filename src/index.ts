import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import Review from './models/Review';
import { Op } from 'sequelize';
import { OpenAI } from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY
});

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

app.post('/formulaPrompt', async(req, res) => {
    try {
        const { prompt, temperature, max_tokens } = req.body;

        const response = await openai.responses.create({
            model             : 'gpt-4o-mini',
            instructions      : 'You are an AI assistant integrated with Bryntum Grid to generate content for a grid cell. Your role is to provide concise, accurate responses based on natural language prompts. Keep responses direct and to the point, avoiding unnecessary explanations or text.',
            input             : prompt,
            max_output_tokens : max_tokens || 100,
            temperature       : temperature || 1
        });

        res.json({
            content : response.output_text
        });
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({
            content : 'There was an error generating the AI content'
        });
    }
});

app.listen(port, () =>
    console.log(`
🚀 Server ready at: http://localhost:${port} 
`)
);