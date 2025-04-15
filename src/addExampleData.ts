import { readFileSync } from 'fs';
import sequelize from './config/database';
import Review from './models/Review';

async function setupDatabase() {
    // Force recreate the table
    await sequelize.sync({ force : true });

    await addExampleData();
}

async function addExampleData() {
    try {
    // Read and parse the JSON data
        const reviewsData = JSON.parse(
            readFileSync('./src/initialData/reviews.json', 'utf-8')
        );

        const reviews = await Review.bulkCreate(reviewsData);
        console.log('reviews added to database successfully.');
        return { reviews };
    }
    catch (error) {
        console.error('Failed to add data to database due to an error: ', error);
    }
}

setupDatabase();
