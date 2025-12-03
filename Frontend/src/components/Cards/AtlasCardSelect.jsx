import { useState, useRef, useEffect } from "react"

import { Box, Container, Typography } from '@mui/material'

import { OutlinedButtonSelect } from './ModelCardSelect'

import { useHistory } from "react-router-dom/cjs/react-router-dom.min"
import AtlasInfo from "components/GeneMapper/AtlasInfo"
import RectSkeleton from "components/Skeletons/RectSkeleton"

/**
 * Atlas Card 
 * @param width default value is 100% of parent
 * @param height default value is 100% of parent
 * @param title title of AtlasCard
 * @param imgLink thumbnail photo url
 * @param classifierLabels
 * @param modalities 
 * @param cellsInReference
 * @param species
 * @param mapLink onHover button Map url
 * @param learnMoreLink onHover button Learn More url
 */
export default function AtlasCardSelect({
  width = "100%", height = "100%", title, inrevision, imgLink, isHCAAtlas, HCAiconLink, classifierLabels, modalities,
  cellsInReference, species, mapLink, learnMoreLink, selected=false, 
  onSelect, selectedAtlas, atlasObject={},isLoading=true
}) {

  //check if the mouse is hovering above the card
  const [isHover, setHover] = useState(false)

  //check if the card is flat(width > height)
  const [isFlat, setFlat] = useState(false)


  const [atlasInfoOpen, setAtlasInfoOpen] = useState(false);

  //ref to get the out most Box
  const boxRef = useRef()
  const history = useHistory();

  //skleton image
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    const image = new Image();
    image.src = imgLink;
    image.onload = () => {
      setIsImageLoaded(true);
    };
    image.onerror = () => {
      setIsImageLoaded(true);
    };
  }, [imgLink]);

  useEffect(() => {
    //each time the card is rerendered, check if the card is flat or not
    if (isImageLoaded && boxRef.current.clientWidth > boxRef.current.clientHeight) setFlat(true)
  }, [])

  return (
    (!isImageLoaded || isLoading)? (
      <RectSkeleton width={width} height={height} sx={{borderRadius: "1.2rem"}} />
    ) :
    <Box
      sx={{
        width, height
      }}
    >
      <Box
        ref={boxRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >

        {
          isHover &&
          <Box
            style={{
              background: "linear-gradient(#4F83CC, #01579B)"
            }}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "1.2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              opacity: 0.95
            }}
          >
            <Box
              sx={{
                margin: "auto",
                width: isFlat ? "70%" : "60%",
                height: isFlat ? "auto" : "40%",
                display: "flex",
                flexDirection: isFlat ? "row" : "column",
                justifyContent: "space-evenly",
              }}
            >
              {
            !inrevision && (
              <OutlinedButtonSelect content={selected ? "Deselect" : "Select"} onSelect = {() => selectedAtlas?.name === atlasObject?.name ? onSelect('') : onSelect(atlasObject)} />
            )}
              <OutlinedButtonSelect content="Learn More" onSelect={() => setAtlasInfoOpen(true)} />
            </Box>
          </Box>
        }

        <Box
          sx={{
            width: '100%',
            height: '100%',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isHover ? 'none' : '0px 4px 6px 0px rgba(33, 37, 41, .2), 0px 0px 1px 0px rgba(33, 37, 41, .32)',
            borderRadius: '1.2rem',
            // justifyContent: 'center',
            justifyContent: 'flex-start',
            borderStyle: 'solid',
            borderColor: selected ? '#008BF5' : 'transparent',
            borderWidth: '4px',
          }}
        >
          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              mt: '-20px',
              pr: '7px',       // ← padding so text never runs under the icon
              // wordBreak: 'break-word',
              
            }}
          >
            {title}
          </Typography>

          {isHCAAtlas && HCAiconLink && (
            <Box
              component="img"
              src={HCAiconLink}
              alt="HCA icon"
              sx={{
                position: 'absolute',
                top: -8,
                right: 8,
                width: 56,
                height: 56,
                zIndex: -1,
                pointerEvents: 'none',   // prevents click blocking
                borderRadius: '50%',     // optional: nice rounded look
              }}
            />
          )}

          <Box component="img" src={imgLink} alt="Atlas preview img"
            sx={{
              width: "100%",        // image can grow up to the card width
              maxWidth: "140px",    // ← your max width
              maxHeight: "120px",   // ← your max height
              margin: "auto",
              objectFit: "contain", // keeps full image visible without cropping
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Classifier labels:
            </Typography>
            &nbsp;
            <Typography noWrap>{classifierLabels}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Modalities:
            </Typography>
            &nbsp;
            <Typography noWrap>{modalities}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Cells in Reference:
            </Typography>
            &nbsp;
            <Typography>{cellsInReference}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Species:
            </Typography>
            &nbsp;
            <Typography>{species}</Typography>
          </Box>
        </Box>
      </Box>
      <AtlasInfo id={atlasObject._id} open={atlasInfoOpen} setOpen={setAtlasInfoOpen} />
    </Box>

  )
}