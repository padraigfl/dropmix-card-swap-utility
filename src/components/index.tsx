import { ReactElement, ReactNode, useState } from "react"
import { createPortal } from "react-dom";


const Dialog = (props: { children: ReactNode, onClose: () => void }) => {
  return createPortal(
    <div className="overlay">
      <div className="dialog">
        <button onClick={props.onClose}>Close</button>
        { props.children }
      </div>
    </div>,
    document.getElementById('modalPortal')!
  )
}

interface DialogProps {
  children: (setOpen: any) => ReactNode;
  buttonText?: string;
  buttonElement?: ReactElement | string;
  initialOpenState?: boolean;
  noOpenButton?: boolean;
  disabled?: boolean;
}

export const DialogControl = (props: DialogProps) => {
  const [isOpen, setOpen] = useState(!!props.initialOpenState);

  if (!props.initialOpenState && props.noOpenButton) {
    throw new Error('Dialog will not function with no open button and closed initially')
  }

  return (
    <>
      {!props.noOpenButton && <button disabled={props.disabled} onClick={() => setOpen(true)}>{props.buttonText || 'Open'}</button>}
      { isOpen && (
        <Dialog onClose={() => setOpen(false)}>
          { props.children(() => setOpen(false)) }
        </Dialog>
      )}
    </>
  )
}