const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');


// Get list of invoices
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    }
     catch (error) {
        return next(error);
    }
});


// Get invoice base on id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const results = await  db.query(`SELECT * FROM invoices WHERE id=$1`,[id]);
        if(results.rows.length === 0){
            throw new ExpressError('Invoice cannot be found', 404);
        }
        return res.json({invoices: results.rows[0]});
    } 
    catch (error) {
        return next(error);
    }
});


// Creates an invoice 
router.post('/', async (req, res, next) => {
    try {
        
        const { comp_code, amt, paid, add_date, paid_date } = req.body;

        const results = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id, comp_code, amt, paid, add_date, paid_date `,
        [comp_code, amt, paid, add_date, paid_date]);
        return res.json({invoice: results.rows[0]});
    } 
    catch (error) {
        return next(error);    
    }
});


// Updates an invoice
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comp_code, amt, paid, add_date, paid_date } = req.body;

        const results = await db.query(`UPDATE invoices 
            SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 
            WHERE id = $6
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt, paid, add_date, paid_date,id]);
            if(results.rows.length === 0){
                throw new ExpressError('Invoice cannot be found', 404);
            }
            return res.json({invoice: results.rows[0]});

    } 
    catch (error) {
        return next(error);
    }
});


// Deletes an invoice
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const results = await db.query(`DELETE FROM invoices WHERE id=$1`,[id]);
        if(results.rows.length === 0){
            throw new ExpressError('Invoice cannot be found', 404);
        }
        return res.json({status:"DELETED!"});
    } catch (error) {
        return next(error);
    }
});


// Get company objectives
router.get('/:code', async (req, res, next) => {
    try {
        const {id} = req.params;

        const results = await db.query(`SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
            FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id =$1`, [id]);
            if(results.rows.length === 0 ){
                throw new ExpressError(`There is no invoice: ${id}`, 404);
            }
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            company:{
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_data: data.add_data,
            paid_data: data.paid_data,
        };
        return res.json({company: invoice});
    } 
    catch (error) {
        return next(error);
    }
})






module.exports = router;