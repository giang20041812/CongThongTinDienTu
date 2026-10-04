import os

def update_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# NewsPages.tsx
update_file('src/pages/NewsPages.tsx', [
    (
        """                      label="ẢNH TIN"
                      subLabel={news.imageFallbackTitle}
                      theme="exam"
                      aspectRatio="16:9"
                    />""",
        """                      label="ẢNH TIN"
                      subLabel={news.imageFallbackTitle}
                      theme="exam"
                      aspectRatio="16:9"
                      imageUrl={news.imageUrl}
                    />"""
    ),
    (
        """              label="ẢNH TIN CHÍNH THỨC"
              subLabel={news.imageFallbackTitle}
              theme="exam"
              aspectRatio="16:9"
            />""",
        """              label="ẢNH TIN CHÍNH THỨC"
              subLabel={news.imageFallbackTitle}
              theme="exam"
              aspectRatio="16:9"
              imageUrl={news.imageUrl}
            />"""
    )
])

print("NewsPages updated.")
