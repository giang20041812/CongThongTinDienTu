package vn.edu.portal.dto;

import vn.edu.portal.entity.Category;
import vn.edu.portal.entity.Post;
import java.util.List;

public class HomepageSectionDTO {
    private Category category;
    private List<Post> posts;

    public HomepageSectionDTO() {}
    
    public HomepageSectionDTO(Category category, List<Post> posts) {
        this.category = category;
        this.posts = posts;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }
}
