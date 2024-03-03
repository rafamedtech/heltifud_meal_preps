import logo from '@/assets/img/logo-horizontal.png';
import { days } from '@/data/menu';

function App() {
  return (
    <>
      <header className='navbar bg-neutral px-4 py-6'>
        <img src={logo} alt='' className='w-40' />
      </header>

      <main>
        <div className='container mx-auto p-4 flex flex-col gap-2'>
          <div>
            <h2 className='text-3xl text-primary'>Menú de la semana</h2>
            <p>Correspondiente a la semana del 4 al 8 de Marzo</p>
          </div>

          <div className='h-[35rem] mt-8 carousel carousel-horizontal carousel-center gap-2 rounded-box mx-auto'>
            {days.map(({ name, image }) => (
              <div className='carousel-item h-full' key={name} id={name}>
                <img src={image} className='rounded-box h-full w-80' />
              </div>
            ))}
          </div>
          <div className='flex justify-center w-full py-2 gap-2'>
            {days.map(({ name }) => (
              <a href={`#${name}`} key={name} className='btn btn-xs btn-primary'>
                {name}
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
