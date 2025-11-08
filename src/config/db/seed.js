import pool, { query } from "../db.js";

const seedDatabase = async () => {
    try {

        await query('DELETE FROM post_to_tag');
        await query('DELETE FROM tags');
        await query('DELETE FROM comments');
        await query('DELETE FROM posts');
        await query('DELETE FROM users');

        const userData = [
            { username: 'admin',
                email: 'adminblog@gmail.com',
                password_hash: 'admin1234',
                role: 'admin'
            },

            { username: 'techWriter',
                email: 'techWriter123',
                password_hash: 'tech1234',
                role: 'blogger'
            },

            {
                username: 'fitness',
                email: 'fit@gmail.com',
                password_hash: 'fit1234',
                role: 'blogger'
            },

            { username: 'Someone',
                email: 'someone12@gmail.com',
                password_hash: 'some1234',
                role: 'reader'
            }
        ];
        
        const createdUsers = [];
        for (const user of userData) {
            const result = await query(
                `INSERT INTO users (username, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                 [user.username, user.email, user.password_hash, user.role]
            );
            createdUsers.push(result.rows[0]);
            console.log(`Created users: ${createdUsers.length} user`);
        }

        const tagsData = [
            'Technology',
            'Health',
            'Travel',
            'Food',
            'Lifestyle',
            'Education',
            'Finance',
            'Entertainment',
            'Sports',
            'Science'
        ];

        const createdTags = [];
        for (const tagName of tagsData) {
            const result = await query(
                `INSERT INTO tags (name) VALUES ($1) RETURNING *`,
                [tagName.toLowerCase()]
            );
            createdTags.push(result.rows[0]);
            console.log(`Created tags: ${createdTags.length} tag`);
        }

        const postData = [
            {
                title: 'Getting Started with Node.js',
                slug: 'getting-started-with-nodejs',
                content: 'Node.js is a powerful JavaScript runtime built on Chrome v8 engine...',
                author_id: createdUsers.find(u => u.role === 'blogger' && u.username === 'techWriter').id,
                published: true,
                tags: ['technology', 'education']
            },

            {
                title: '10 Tips for Healthy Living',
                slug: '10-tips-for-healthy-living',
                content: 'Living a healthy life involves more than just eating right and exercising...',
                author_id: createdUsers.find(u => u.role === 'blogger' && u.username === 'fitness').id,
                published: true,
                tags: ['health', 'lifestyle']
            }
        ];

        const createdPosts = [];
        for (const post of postData) {
            const result = await query(
                `INSERT INTO posts (title, slug, content, author_id, published)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                 [post.title, post.slug, post.content, post.author_id, post.published]
            );
            createdPosts.push(result.rows[0]);
            console.log(`Created posts: ${createdPosts.length} posts`);

            for (const tagName of post.tags){
                const tag = createdTags.find(t => t.name === tagName);
                if(tag){
                    await query(
                        `INSERT INTO post_to_tag (post_id, tag_id)
                         VALUES ($1, $2)`, [result.rows[0].id, tag.id]
                    );
                }
            }
        }
        console.log(`Created ${createdPosts.length} posts with tags.`);

        const commentData = [
            {
                content: 'Great introduction to Node.js! Very helpful for beginners. Looking forward to more posts like this.',
                post_id: createdPosts[0].id,
                user_id: createdUsers.find(u => u.role === 'reader').id
            }
        ];
        const createdComments = [];
        for (const comment of commentData) {
            const result = await query(
                `INSERT INTO comments (content, post_id, user_id)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [comment.content, comment.post_id, comment.user_id]
            );
            createdComments.push(result.rows[0]);
        }
        console.log(`Created ${createdComments.length} comments.`);

        const userCount = await query(`SELECT COUNT(*) FROM users`);
        const tagCount = await query(`SELECT COUNT(*) FROM tags`);
        const postCount = await query(`SELECT COUNT(*) FROM posts`);
        const commentCount = await query(`SELECT COUNT(*) FROM comments`);

        console.log(`Seeding completed:`);
        console.log(`Users: ${userCount.rows[0].count}`);
        console.log(`Tags: ${tagCount.rows[0].count}`);
        console.log(`Posts: ${postCount.rows[0].count}`);
        console.log(`Comments: ${commentCount.rows[0].count}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await pool.end();
    }
};
seedDatabase();
export default seedDatabase;