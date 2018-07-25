const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');

//Validatoin

const validatePostInput = require('../../validation/post');
// @route GET /api/posts/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => res.status(200).json({msg: "Posts work"}));

// @route GET /api/posts/
// @desc Gets posts
// @access Public

router.get('/', (req, res)=>{
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({nopostfound: 'No posts found'}));
});

// @route GET /api/posts/:id
// @desc Gets post by id
// @access Public
router.get('/:id', (req, res)=>{
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that id'})
    );
})

// @route POST /api/posts/
// @desc Create a post
// @access Private
router.post('/',passport.authenticate('jwt', {session: false}), (req, res)=>{
    const {errors, isValid} = validatePostInput(req.body);
    if(!isValid){
        res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name:req.body.name,
        avatar: req.body.avatar,
        user:req.user.id
})

    newPost.save().then(post => {
        console.log("Trying to save");
        res.json(post)})
        .catch(err => res.status(400).json({
            error: err
        }));
})
// @route DELETE /api/posts/:id
// @desc Deletes post by id
// @access Private

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                //check for post owner
                if(post.user.toString() !== req.user.id ){
                    return res.status(401).json({notauthorized: 'User not authorized'});
                }

                //Delete
                post.remove().then(() => res.json({success: 'true'}));
            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}));
        })

})

// @route POST /api/posts/like:id
// @desc  Like post
// @access Private

router.post(
        '/like/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                    return res.status(400).json({alreadyliked:"User already liked post"})                    
                }
                //Add user id to likes array
                post.likes.unshift({user: req.user.id});
                post.save()
                    .then(post => res.json(post) );

            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}));
        })

})

// @route POST /api/posts/unlike:id
// @desc  Unlike post
// @access Private

router.post(
    '/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
Profile.findOne({user:req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res
                    .status(400)
                    .json({notliked:"You have not yet liked the post"});                   
            }
            //Get the remove index
            const removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

            //Splice out of array
            post.likes.splice(removeIndex, 1);

            //Posts save
            post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    })

});

// @route POST /api/posts/comment/:id
// @desc  Add a comment to post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req,res)=>{
    const {errors, isValid} = validatePostInput(req.body);
    console.log("Add comment");
    console.log(errors);
    console.log(isValid);

    if(!isValid){
        res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user:req.user.id
            }
            //Add to comments array
            post.comments.unshift(newComment);

            post.save().then(post => res.json(post))
                .catch(err => res.status(404).json({postnotfound: "No post found"}));
        })
        .catch(err => res.status(404).json({postnotfound: "No post found"}));
})

// @route DELETE /api/posts/comment/:id/:comment_id
// @desc  Remove comment from post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req,res)=>{
    
    Post.findById(req.params.id)
        .then(post => {
            //Check to see if comment exists
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({commentnotexists:"Comment does not exists"});
            }
            // Get remove nidex;
            const removeIndex = post.comments
                    .map(item => item._id.toString())
                    .indexOf(req.params.comment_id);

            //Splice comment out of array
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound:'No post found'}))
    })
module.exports = router;
