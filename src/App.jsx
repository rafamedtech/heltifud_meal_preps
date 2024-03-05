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
          <section>
            <h2 className='text-3xl text-primary'>Menú de la semana</h2>
            <p>Correspondiente a la semana del 4 al 8 de Marzo</p>
          </section>

          <button className='btn w-fit btn-primary mx-auto'>Ordenar</button>

          <section className='h-[35rem] mt-4 carousel carousel-horizontal carousel-center gap-2 rounded-box mx-auto'>
            {days.map(({ name, image }) => (
              <div className='carousel-item h-full' key={name} id={name}>
                <img src={image} className='rounded-box h-full w-80' />
              </div>
            ))}
          </section>

          <section className='flex justify-center w-full py-2 gap-2 px-4'>
            {days.map(({ name }) => (
              <a href={`#${name}`} key={name} className=' badge text-xl p-3 badge-primary badge-lg'>
                {name}
              </a>
            ))}
          </section>

          <section className='bg-neutral text-base-100 flex p-4 items-center gap-4 mt-4 rounded-box'>
            <p className='text-primary text-2xl'>
              ¿Tienes una dieta de tu nutriólogo? <br />{' '}
              <span className='text-base-100 text-lg'>¡La cocinamos a la medida!</span>
            </p>
            <button className='btn btn-primary'>¡Cotizar!</button>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
