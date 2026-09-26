function AppIcon({ app, onOpen }) {
  return (
    <button type="button" className="app-icon" onClick={() => onOpen(app.id)}>
      <span className={`app-badge app-badge-${app.iconTone}`}>{app.iconGlyph}</span>
      <span className="app-label">{app.name}</span>
    </button>
  )
}

export default AppIcon
