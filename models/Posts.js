import Model from './model.js';

export default class Posts extends Model {
    constructor() {
        super(false /* secured Id */);

        this.addField('Title', 'string');
        this.addField('Text', 'string');
        this.addField('Category', 'string');
        this.addField('Image','asset')
        this.addField('Creation','integer')
              
        this.setKey("Title");
    }
}