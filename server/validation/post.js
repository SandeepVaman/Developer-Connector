const Validator =  require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data){
    let errors = {};
    
    data.text = !isEmpty(data.text) ? data.text : '';

    if(!Validator.isLength(data.text, {min:3, max:300})){
        errors.text = 'post must be between 3 to 300 characters'
    }

    if(Validator.isEmpty(data.text)){
        errors.text = 'text is a required field';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}