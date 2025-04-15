import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database';
import { ReviewSchemaType } from '../types';

// order of InferAttributes & InferCreationAttributes is important
interface ReviewModel extends Model<InferAttributes<ReviewModel>, InferCreationAttributes<ReviewModel, { omit: 'id' }>>, ReviewSchemaType  {}

const Review = sequelize.define<ReviewModel>(
    'Review',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true,
            allowNull     : true
        },
        restaurant : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        location : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        review : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        response : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        foodItem : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        sentiment : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        notes : {
            type      : DataTypes.STRING,
            allowNull : true
        }
    },
    {
        tableName  : 'reviews',
        timestamps : false,
        indexes    : [
            {
                fields : ['review', 'restaurant']
            }
        ]
    }
);

export default Review;