import React, { useState } from 'react';
import HojasVidaPage from './HojasVidaPage';
import HojaVidaDetallePage from './HojaVidaDetallePage';
import MensajeriaPage from './MensajeriaPage';
import EventosCalendariosPage from './EventosCalendariosPage';

function ModulosVidaEstudiantil() {
  const [vistaActual, setVistaActual] = useState('hojasvida');
  const [hojaSeleccionada, setHojaSeleccionada] = useState(null);

  return (
    <div>
      <div className="d-flex gap-2 mb-4">
        <button className={`btn ${vistaActual === 'hojasvida' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => { setVistaActual('hojasvida'); setHojaSeleccionada(null); }}>
          Hojas de Vida
        </button>
        <button className={`btn ${vistaActual === 'mensajeria' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setVistaActual('mensajeria')}>
          Mensajería
        </button>
        <button className={`btn ${vistaActual === 'eventos' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setVistaActual('eventos')}>
          Calendario y Muro
        </button>
      </div>

      {vistaActual === 'hojasvida' && !hojaSeleccionada && (
        <HojasVidaPage onVerDetalle={(id) => setHojaSeleccionada(id)} />
      )}
      {vistaActual === 'hojasvida' && hojaSeleccionada && (
        <HojaVidaDetallePage hojaId={hojaSeleccionada} onVolver={() => setHojaSeleccionada(null)} />
      )}
      {vistaActual === 'mensajeria' && <MensajeriaPage />}
      {vistaActual === 'eventos' && <EventosCalendariosPage />}
    </div>
  );
}

export default ModulosVidaEstudiantil;