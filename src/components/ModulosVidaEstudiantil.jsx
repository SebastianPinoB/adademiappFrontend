import React, { useState } from 'react';
import HojasVidaPage from './HojasVidaPage';
import HojaVidaDetallePage from './HojaVidaDetallePage';

function ModulosVidaEstudiantil() {
  const [hojaSeleccionada, setHojaSeleccionada] = useState(null);

  return (
    <div>
      {!hojaSeleccionada
        ? <HojasVidaPage onVerDetalle={(id) => setHojaSeleccionada(id)} />
        : <HojaVidaDetallePage hojaId={hojaSeleccionada} onVolver={() => setHojaSeleccionada(null)} />
      }
    </div>
  );
}

export default ModulosVidaEstudiantil;