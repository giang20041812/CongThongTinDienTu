import React from 'react';
import { usePhotos } from '../api';
import { postRoute } from '../lib/content';
import { Link } from '../lib/router';
import { ImageIcon } from './icons';
import { Container, Reveal, SectionHeading, SmartImage, cx } from './ui';

/** A large lead photo plus eight tiles: fills 4×3 cells on desktop and 3×4 on tablets; phones show the first five. */
const PHOTO_COUNT = 9;
const PHONE_COUNT = 5;

const gridClass = 'grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-3 lg:auto-rows-[190px] lg:grid-cols-4 lg:gap-4';
const tileClass = (index: number) => cx(index === 0 && 'col-span-2 row-span-2', index >= PHONE_COUNT && 'hidden sm:block');

/** Home gallery: the newest photos of published posts (a couple per post); each opens its post. */
export const PhotoGallerySection: React.FC = () => {
  const { data: photos, loading } = usePhotos(PHOTO_COUNT);
  if (!loading && photos.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            icon={ImageIcon}
            eyebrow="Khoảnh khắc"
            title="Thư viện ảnh"
            description="Hình ảnh mới nhất từ các hoạt động của thầy và trò nhà trường."
          />
        </Reveal>
        <Reveal>
          {loading ? (
            <div className={gridClass} aria-hidden="true">
              {Array.from({ length: PHOTO_COUNT }, (_, index) => (
                <div key={index} className={cx('skeleton rounded-2xl', tileClass(index))} />
              ))}
            </div>
          ) : (
            <ul className={gridClass}>
              {photos.map((photo, index) => {
                const lead = index === 0;
                return (
                  <li key={photo.url} className={tileClass(index)}>
                    <Link
                      to={postRoute(photo)}
                      className="group relative block h-full overflow-hidden rounded-2xl shadow-card transition-shadow duration-500 hover:shadow-card-hover"
                    >
                      <SmartImage
                        src={photo.url}
                        alt={photo.title}
                        width={lead ? 900 : 480}
                        className="h-full w-full"
                        imgClassName="group-hover:scale-105"
                      />
                      <span
                        className={cx(
                          'pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent transition-opacity duration-500',
                          lead ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cx(
                          'pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 p-3 font-semibold leading-snug text-white transition-all duration-500 sm:p-4',
                          lead
                            ? 'text-[14px] sm:text-[16px]'
                            : 'translate-y-2 text-[12.5px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
                        )}
                        aria-hidden="true"
                      >
                        {photo.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>
      </Container>
    </section>
  );
};
