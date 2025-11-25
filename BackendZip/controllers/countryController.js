const Country = require('../models/Country')

const countryController = {
    async getAllCountries(req, res) {
        try {
            const countries = await Country.findAll()
            res.json({
                success: true,
                data: countries // This should now be an array
            });
        } catch (err) {
            console.error('Get countries error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching countries'
            });
        }
    }
}

module.exports=countryController;