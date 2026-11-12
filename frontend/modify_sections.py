import os
import re

def update_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# SchoolShowcaseSection.tsx
update_file('src/components/SchoolShowcaseSection.tsx', [
    (
        """                      theme={idx === 0 ? 'campus' : idx === 1 ? 'lab' : 'ceremony'}
                      aspectRatio="16:9"
                    />""",
        """                      theme={idx === 0 ? 'campus' : idx === 1 ? 'lab' : 'ceremony'}
                      aspectRatio="16:9"
                      imageUrl={item.imageUrl}
                    />"""
    )
])

# NewsAndAnnouncementsSection.tsx
update_file('src/components/NewsAndAnnouncementsSection.tsx', [
    (
        """                            theme={idx % 2 === 0 ? 'exam' : 'lab'}
                            aspectRatio="16:9"
                          />""",
        """                            theme={idx % 2 === 0 ? 'exam' : 'lab'}
                            aspectRatio="16:9"
                            imageUrl={item.imageUrl}
                          />"""
    ),
    (
        """                      label="ẢNH TIN CHÍNH"
                      subLabel={featuredNews.imageFallbackTitle || 'TIN TỨC NỔI BẬT'}
                      theme="campus"
                      aspectRatio="banner"
                    />""",
        """                      label="ẢNH TIN CHÍNH"
                      subLabel={featuredNews.imageFallbackTitle || 'TIN TỨC NỔI BẬT'}
                      theme="campus"
                      aspectRatio="banner"
                      imageUrl={featuredNews.imageUrl}
                    />"""
    ),
    (
        """                        subLabel={news.imageFallbackTitle || 'TIN TỨC'}
                        theme="lab"
                        aspectRatio="compact"
                      />""",
        """                        subLabel={news.imageFallbackTitle || 'TIN TỨC'}
                        theme="lab"
                        aspectRatio="compact"
                        imageUrl={news.imageUrl}
                      />"""
    )
])

print("Sections updated.")
