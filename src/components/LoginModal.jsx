function LoginModal({ email, password, error, onClose, onSubmit, onEmailChange, onPasswordChange }) {
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <h5 className="mb-3">Iniciar Sesión</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">Ingresar</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
