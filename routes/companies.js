const express = require('express');
const router = new express.Router();
const db = require('../db')
const ExpressError = require('../expressError');

// Gets the list of companies
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies');
        return res.json({companies: results.rows});
    } 
    catch (error) {
        return next(error);
    }
});

// Gets a list of a specific company
router.get('/:code', async (req, res, next) => {
    try {
        const {code} = req.query;
        
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code=$1`, [code]);
        // if(results.rows.length === 0){
        //     throw new ExpressError('Company cannot be found', 404);
        // }
        return res.json({company: results.rows});
    } 
    catch (error) {
        return next(error);
    }
});


// Adds a new company
router.post('/', async (req, res, next) => {
    try {
        const {code, name, description} = req.body;

        const results = await db.query(`INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } 
    catch (error) {
        return next(error);
    }
});


// Edit an existing company
router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description} = req.body;

        const results = await db.query(`UPDATE companies SET name=$1, description=$2
             WHERE code=$3 RETURNING code, name, description`,[name, description, code]);
        if(results.rows.length === 0){
            throw new ExpressError('Company cannot be found', 404);
        }    
        return res.json({company: results.rows[0]});
    }
     catch (error) {
        return next(error);
    }
});


// Delete a company
router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        if(results.rows.length === 0){
            throw new ExpressError('Company cannot be found', 404);
        }
        return res.json({status:"Deleted"});
    } 
    catch (error) {
        return next(error);
    }
});


module.exports = router;