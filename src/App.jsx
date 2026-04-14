import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [paso, setPaso] = useState('login') // 'login' o 'registro'
  const [asesores, setAsesores] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [form, setForm] = useState({ correo: '', password: '' })

  // Cargar asesores solo si entran a registro
  useEffect(() => {
    if (paso === 'registro') {
      const getAsesores = async () => {
        const { data } = await supabase.from('lista_asesores').select('*').eq('registrado', false)
        if (data) setAsesores(data)
      }
      getAsesores()
    }
  }, [paso])

  const handleLogin = (e) => {
    e.preventDefault()
    alert("Validando con Supabase Auth...")
  }

  const finalizarRegistro = async (e) => {
    e.preventDefault()
    // Aquí actualizamos en Supabase que el asesor ya tiene correo y clave
    const { error } = await supabase
      .from('lista_asesores')
      .update({ 
        registrado: true,
        // Aquí podrías guardar el correo si añades la columna en Supabase
      })
      .eq('id', seleccionado.id)
    
    if (!error) {
      alert(`¡Registro exitoso para ${seleccionado.nombre}! Ya puedes loguearte.`)
      setPaso('login')
    }
  }

  return (
    <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '15px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        {paso === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Portal Calidad</h2>
            <input type="text" placeholder="Correo" style={inputStyle} />
            <input type="password" placeholder="Contraseña" style={inputStyle} />
            <button type="submit" style={btnPrincipal}>Ingresar</button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '15px' }}>
              <span style={{ color: '#888', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
              <span onClick={() => setPaso('registro')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>
                ¿ES TU PRIMERA VEZ? REGÍSTRATE
              </span>
            </div>
          </form>
        ) : (
          <div>
            <h2 style={{ textAlign: 'center' }}>Registro Asesor</h2>
            {!seleccionado ? (
              <>
                <p style={{ fontSize: '12px', color: '#aaa' }}>Busca tu nombre en la lista:</p>
                <select onChange={(e) => setSeleccionado(asesores.find(a => a.id == e.target.value))} style={inputStyle}>
                  <option value="">Selecciona tu nombre...</option>
                  {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <button onClick={() => setPaso('login')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', width: '100%' }}>Volver</button>
              </>
            ) : (
              <form onSubmit={finalizarRegistro}>
                <p>Hola, <b>{seleccionado.nombre}</b></p>
                <input type="email" placeholder="Tu correo personal" required style={inputStyle} />
                <input type="password" placeholder="Crea tu contraseña" required style={inputStyle} />
                <button type="submit" style={btnPrincipal}>Finalizar Registro</button>
                <button onClick={() => setSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', width: '100%', marginTop: '10px' }}>Elegir otro nombre</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos rápidos
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2a2a2a', color: 'white', boxSizing: 'border-box' }
const btnPrincipal = { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }

export default App