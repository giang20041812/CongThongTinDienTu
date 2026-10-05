package vn.edu.portal.dto;

import java.util.List;

public class HomepageResponseDTO {
    private List<HomepageSectionDTO> topSections;
    private List<HomepageSectionDTO> bottomSections;

    public HomepageResponseDTO() {}

    public HomepageResponseDTO(List<HomepageSectionDTO> topSections, List<HomepageSectionDTO> bottomSections) {
        this.topSections = topSections;
        this.bottomSections = bottomSections;
    }

    public List<HomepageSectionDTO> getTopSections() {
        return topSections;
    }

    public void setTopSections(List<HomepageSectionDTO> topSections) {
        this.topSections = topSections;
    }

    public List<HomepageSectionDTO> getBottomSections() {
        return bottomSections;
    }

    public void setBottomSections(List<HomepageSectionDTO> bottomSections) {
        this.bottomSections = bottomSections;
    }
}
