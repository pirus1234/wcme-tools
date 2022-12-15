import {useEffect, useRef} from "react"

const PCMS = () => {
  const ref = useRef()
  useEffect(() => {
    //console.log(ref.current)
  }, [])

  return (
    <div
      ref={ref}
      id="PCMS_iframe"
      dangerouslySetInnerHTML={{
        __html: `
        <iframe 
          src='https://wcme.ddns.net/api/proxy/' 
          allow='fullscreen' 
          frameborder=0
          width=100%
          height=1000px
          allowfullscreen
          referrerpolicy="strict-origin"
        />`,
      }}
    />
  )
}

export default PCMS
