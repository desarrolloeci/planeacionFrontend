import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Grid, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const API_URL = "http://localhost:8080/api/home-parameters";

const Inicio = () => {
  const [column1, setColumn1] = useState("");
  const [column2, setColumn2] = useState("");

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data && data.length > 0) {
          const base64String = data[0].contenidoBase64;
          const htmlDecoded = atob(base64String);

          if (isLargeScreen) {
            
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlDecoded;
            const children = Array.from(tempDiv.children);
            const middleIndex = Math.ceil(children.length / 2);

            const firstHalf = children
              .slice(0, middleIndex)
              .map((node) => node.outerHTML)
              .join("");
            const secondHalf = children
              .slice(middleIndex)
              .map((node) => node.outerHTML)
              .join("");

            setColumn1(firstHalf);
            setColumn2(secondHalf);
          } else {
            
            setColumn1(htmlDecoded);
            setColumn2("");
          }
        }
      } catch (error) {
        console.error("Error cargando contenido desde la API:", error);
      }
    };

    loadContent();
  }, [isLargeScreen]);

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <div dangerouslySetInnerHTML={{ __html: column1 }} />
        </Grid>
        {column2 && (
          <Grid item xs={12} md={6}>
            <div dangerouslySetInnerHTML={{ __html: column2 }} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Inicio;
