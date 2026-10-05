package vn.edu.portal.entity;

/**
 * How a menu entry (category) is rendered. Content always belongs to a category,
 * so switching the type only changes the presentation, never the data.
 */
public enum PageType {
    /** Top-level menu heading; its page lists the child entries. Holds no posts itself. */
    GROUP,
    /** Single content page (e.g. "Giới thiệu chung"): shows the newest post of the category. */
    PAGE,
    /** Card grid of articles. */
    POST_LIST,
    /** Table of documents/notices: number, issue date, issuer, attachments. */
    DOCUMENT_LIST,
    /** Class timetable. */
    SCHEDULE,
    /** Contact details from the site settings. */
    CONTACT,
    /** Map of the school location. */
    MAP,
    /** Public feedback form. */
    FEEDBACK,
    /** Opens {@code externalUrl}. Holds no posts. */
    LINK;

    /** Whether posts may be filed under a category of this type. */
    public boolean holdsPosts() {
        return this != GROUP && this != LINK;
    }
}
