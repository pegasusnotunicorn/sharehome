import { StyleSheet } from '@react-pdf/renderer';
import * as cardConstants from '../../../components/Designer/utils/cardConstants.js';

export const dynamicStylesPDFPerson = StyleSheet.create({
  page:{
    width:cardConstants.pdfDimensions.width,
    height:cardConstants.pdfDimensions.height,
    display:"block",
    position:"relative",
    color:"white",
    fontFamily:'Rowdies-Regular',
  },
  view:{
    display:"inline-block",
    position:"relative",
    height:"100%",
    width:"100%",
    whiteSpace:"nowrap",
  },
  image:{
    objectFit:"cover",
    height:"100%",
  },
  canvas:{
    width:cardConstants.pdfDimensions.width,
    height:cardConstants.pdfDimensions.height/2,
    position:"absolute",
    display:"block",
    bottom:0
  },
  mainFont:{
    fontSize:cardConstants.pdfDimensions.mainFont,
    padding:cardConstants.pdfDimensions.padding,
    paddingBottom:cardConstants.pdfDimensions.padding/2,
    position:"absolute",
    left:0,
    bottom:25,
    maxLines:1,
    textTransform:"uppercase",
  },
  subFont:{
    fontSize:cardConstants.pdfDimensions.subFont,
    padding:cardConstants.pdfDimensions.padding,
    position:"absolute",
    left:0,
    bottom:0,
    maxLines:1,
    paddingTop:0,
    letterSpacing:2,
  },
  japaneseName:{
    fontFamily:'Genshin Gothic Monospace ExtraLight',
    color:"white",
    fontSize:12
  },
});

export const dynamicStylesPDFBack = StyleSheet.create({
  page:{
    width:cardConstants.pdfDimensions.width,
    height:cardConstants.pdfDimensions.height,
    display:"block",
    position:"relative",
    fontFamily:'Rowdies-Regular',
    textAlign:"center",
  },
  view:{
    display:"inline-block",
    position:"relative",
    height:"100%",
    width:"100%",
    whiteSpace:"nowrap",
  },
  mainFont:{
    fontSize:cardConstants.pdfDimensions.mainFont * 1.5,
    width:cardConstants.pdfDimensions.width,
    padding:cardConstants.pdfDimensions.padding,
    paddingBottom:cardConstants.pdfDimensions.padding/2,
    position:"absolute",
    left:0,
    top:25,
    maxLines:2,
    textTransform:"uppercase",
  },
  textJapanese:{
    fontFamily:'Genshin Gothic Monospace ExtraLight',
    fontSize:cardConstants.pdfDimensions.subFont,
    position:"absolute",
    left:50,
    bottom:30,
    padding:5,
    paddingBottom:0,
    maxLines:1,
    paddingTop:0,
  },
});

export const dynamicStylesPDFEventGoal = StyleSheet.create({
  page:{
    width:cardConstants.pdfDimensions.width,
    height:cardConstants.pdfDimensions.height,
    display:"block",
    position:"relative",
    fontFamily:'Rowdies-Regular',
    textAlign:"center",
  },
  view:{
    height:"100%",
    width:"100%",
    overflow:'hidden',
  },
  canvas:{
    display:"block",
    width:"100%",
    height:"100%"
  },
  mainFont:{
    fontSize:cardConstants.pdfDimensions.subFont,
    padding:cardConstants.pdfDimensions.padding * 0.5,
    width:cardConstants.pdfDimensions.width - (cardConstants.pdfDimensions.padding * 2),
    height:cardConstants.pdfDimensions.height - (cardConstants.pdfDimensions.padding * 3.5),
    textAlign:"left",
    position:"absolute",
    left:cardConstants.pdfDimensions.padding,
    top:cardConstants.pdfDimensions.padding,
    color:"#323232",
    backgroundColor:"white",
    textOverflow:"clip",
  },
  footerView:{
    color:"#323232",
    backgroundColor:"white",
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    position:"absolute",
    left:cardConstants.pdfDimensions.padding,
    bottom:cardConstants.pdfDimensions.padding,
    width:cardConstants.pdfDimensions.width - (cardConstants.pdfDimensions.padding * 2),
    borderTop:"1 #323232 solid",
  },
  subFont:{
    padding:cardConstants.pdfDimensions.padding * 0.5,
    fontSize:cardConstants.pdfDimensions.subFont / 2,
    color:"#323232",
    textAlign:"left",
    display:"inline-block",
  }
});
