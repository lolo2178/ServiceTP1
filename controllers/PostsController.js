
import Post from '../models/Posts.js';
import Repository from '../models/repository.js';
import Controller from './Controller.js';

export default class PostsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new Post()));
    }
}