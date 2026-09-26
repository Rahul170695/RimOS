import { Rnd } from 'react-rnd'

function WindowShell({
  appId,
  title,
  windowItem,
  onFocus,
  onClose,
  onMinimize,
  onChangeBounds,
  children,
}) {
  return (
    <Rnd
      bounds="parent"
      size={{ width: windowItem.width, height: windowItem.height }}
      position={{ x: windowItem.x, y: windowItem.y }}
      minWidth={460}
      minHeight={280}
      onDragStart={() => onFocus(appId)}
      onMouseDown={() => onFocus(appId)}
      onDragStop={(_event, data) => onChangeBounds(appId, { x: data.x, y: data.y })}
      onResizeStop={(_event, _direction, ref, _delta, position) =>
        onChangeBounds(appId, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y,
        })
      }
      style={{ zIndex: windowItem.z }}
      className="window-shell"
    >
      <section className="window-frame">
        <header className="window-titlebar">
          <p>{title}</p>
          <div className="window-actions">
            <button type="button" onClick={() => onMinimize(appId)} aria-label="Minimize window">
              —
            </button>
            <button type="button" onClick={() => onClose(appId)} aria-label="Close window">
              ×
            </button>
          </div>
        </header>
        <div className="window-content">{children}</div>
      </section>
    </Rnd>
  )
}

export default WindowShell
