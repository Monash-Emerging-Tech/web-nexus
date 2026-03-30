import BlockHandler from '@/components/notion/BlockHandler';
import { getBlogContent } from '@/lib/notion/pages';

const Page = async () => {
  const blog = await getBlogContent({
    blogId: '1e91d893-3ee3-8085-9004-dd6e6df47f53',
  });

  return (
    <div className='bg-white w-full h-min-screen flex flex-row justify-center'>
      <div className='w-2/3 flex flex-col gap-4'>
        {blog.map((component) => (
          <BlockHandler key={component.id} component={component} />
        ))}
      </div>
    </div>
  )
}

export default Page;