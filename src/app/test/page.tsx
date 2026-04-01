import BlockHandler from '@/components/notion/BlockHandler';
import { getBlogBySlug } from '@/lib/notion/pages';
import { PageObject } from '@/lib/notion/types';

const Page = async () => {
  const blog: PageObject | null = await getBlogBySlug({
    slug: '1e91d893-3ee3-8085-9004-dd6e6df47f53',
  });

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <div className='bg-white text-black w-full h-min-screen gap-4 flex flex-col items-center justify-start'>
      <div className='relative w-full h-[40vh]'>
        <span className='absolute left-0 bottom-0 z-10 text-white text-5xl font-offbit-101 font-semibold px-16 py-6'>
          {blog.title}
        </span>
        <img
          src={
            blog.cover?.type === "external"
              ? blog.cover.external.url
              : blog.cover?.type === "file"
                ? blog.cover.file.url
                : '/img/Nav-Team.JPG'
          }
          alt={"Blog Icon"}
          className="w-full h-full object-cover brightness-60"
        />
      </div>
      <div className='w-3/4 flex flex-col gap-4'>
        {blog.content.map((component) => (
          <BlockHandler key={component.id} component={component} />
        ))}
      </div>
    </div>
  )
}

export default Page;