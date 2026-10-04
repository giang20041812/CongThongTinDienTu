import os
import re

def update_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Simple heuristic: if there's a map(item => or map(news =>, we use the respective variable.
                # But it's easier to just do explicit replacements based on known patterns.
                # Let's just find <EduImageFrame ... /> and add imageUrl={...} if we can guess the variable.
                
                # Replace for news
                content = re.sub(
                    r'(<EduImageFrame[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={news.imageUrl}\n' + m.group(2) if 'news.' in m.group(1) else m.group(0),
                    content
                )
                
                # Replace for item
                content = re.sub(
                    r'(<EduImageFrame[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={item.imageUrl}\n' + m.group(2) if 'item.' in m.group(1) and 'imageUrl=' not in m.group(1) else m.group(0),
                    content
                )

                # Replace for featuredNews
                content = re.sub(
                    r'(<EduImageFrame[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={featuredNews.imageUrl}\n' + m.group(2) if 'featuredNews.' in m.group(1) and 'imageUrl=' not in m.group(1) else m.group(0),
                    content
                )
                
                # Replace for currentClub
                content = re.sub(
                    r'(<EduImageFrame[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={currentClub.imageUrl}\n' + m.group(2) if 'currentClub.' in m.group(1) and 'imageUrl=' not in m.group(1) else m.group(0),
                    content
                )
                
                # Special cases for ADMISSION_DATA.featured
                content = re.sub(
                    r'(<EduImageFrame[^>]*subLabel="Tuyển sinh 2026"[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={ADMISSION_DATA.featured.imageUrl}\n' + m.group(2) if 'imageUrl=' not in m.group(1) else m.group(0),
                    content
                )
                
                # Special cases for STUDY_ABROAD_DATA.featured
                content = re.sub(
                    r'(<EduImageFrame[^>]*subLabel="Học bổng Quốc tế"[^>]*?)(/?>)',
                    lambda m: m.group(1) + ' imageUrl={STUDY_ABROAD_DATA.featured.imageUrl}\n' + m.group(2) if 'imageUrl=' not in m.group(1) else m.group(0),
                    content
                )

                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

update_directory('src/components')
update_directory('src/pages')
print("All pages updated")
