import { Box, Button, Typography } from "@mui/material"
import ClassifierInfo from "components/GeneMapper/ClassifierInfo"
import { useEffect, useRef, useState } from "react"
import { colors } from "shared/theme/colors"
import RectSkeleton from "components/Skeletons/RectSkeleton"

// Outlined Button specific to Models and Atlases
/**
 * OutlinedButton
 * Specific to Model and Atlas Cards
 * @param content text content to be displayed
 * @param link button href link  
 */
const OutlinedButtonSelect = ({ content, onSelect, disabled = false }) => {
  return (
    <Button
      variant="outlined"
      disableRipple
      onClick={onSelect}
      sx={{
        color: !disabled ? colors.primary[100] : colors.neutral[800], borderWidth: "2px",
        borderColor: !disabled ? colors.primary[100] : colors.neutral[800],
        borderRadius: "1.2rem", justifyContent: 'center', textAlign: 'center',
        ":hover": {
          borderColor: !disabled ? '#01579B' : colors.neutral[600], borderWidth: "2px",
          backgroundColor: !disabled ? colors.primary[100] : colors.neutral[100],
          color: !disabled ? '#01579B' : colors.neutral[600], transition: '0.5s'
        }
      }}
    >
      {content}
    </Button>
  )
}

/**
 * ClassifierCard
 * @param width default value 100% of parent
 * @param height default value 100% of parent
 * @param title
 * @param description
 * @param mapLink onHover button Map url
 * @param learnMoreLink onHover button Learn More url
 */
export const ClassifierCard = ({
  width = "100%", height = "100%", title, description, onSelect,
  selected, learnMoreLink, selectedClassifier, classifierObject = {}, disabled = false, isLoading = true
}) => {

  const [hover, setHover] = useState(false)
  const ref = useRef()
  const [flexDir, setFlexDir] = useState("column")
  const [classifierInfoOpen, setClassifierInfoOpen] = useState(false);

  useEffect(() => {
    // checks if the parent element is wider than it is longer
    // if it is, converts the flex direction to row
    if (!isLoading && ref.current.clientWidth > ref.current.clientHeight) {
      setFlexDir("row")
    }
  }, [])

  return (
    (isLoading) ? (
      <RectSkeleton width={width} height={height} sx={{ borderRadius: "1.2rem" }} />
    ) :
      <Box
        sx={{
          width: width,
          height: height,
        }}
      >
        <Box
          ref={ref}
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            cursor: disabled ? "pointer" : "initial",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {(hover || disabled) &&
            <Box
              style={{ background: !disabled ? "linear-gradient(#4F83CC, #01579B)" : "linear-gradient(#e7e7e7, #d0d0d0)" }}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "1.2rem",
                p: "1rem",
                opacity: 0.9
              }}>
              {disabled &&
                <Typography sx={{ position: "absolute", fontSize: "10px", fontWeight: "bold", color: colors.neutral[900], textAlign: "center", left: "25%", top: '10%' }}>
                  Not Compatible
                </Typography>}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {!disabled &&
                  <OutlinedButtonSelect
                    content={selected ? "Deselect" : "Select"}
                    onSelect={() => selectedClassifier?.name === classifierObject?.name ? onSelect('') : onSelect(classifierObject)}
                  />}
                {console.log('selected classifier', selectedClassifier)}
                {console.log('object', classifierObject)}
                {hover && <OutlinedButtonSelect content="Learn More" onSelect={() => setClassifierInfoOpen(true)} disabled={disabled} />}
              </Box>
            </Box>
          }
          <Box sx={{
            width: '100%',
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: "1.2rem",
            boxShadow: hover ? "none" : "0px 0px 10px rgba(0, 0, 0, 0.15)",
            borderRadius: "1.2rem",
            borderStyle: "solid",
            borderColor: selected ? "#008BF5" : 'transparent',
            borderWidth: "4px",
          }}
          >
            <Typography sx={{ fontSize: "1.4rem", fontWeight: "bold", color: "#000000" }}>{title}</Typography>
            <Typography
              className="modelDescription"
              sx={{
                paddingTop: '10px',
                fontSize: "1rem",
                color: colors.neutral[800],
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}>
              {description}
            </Typography>
          </Box>
        </Box>
        <ClassifierInfo id={classifierObject._id} open={classifierInfoOpen} setOpen={setClassifierInfoOpen} />
      </Box>
  )
}