/*
 * To change this license header, choose License Headers in Project Properties.
 */
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/AddExistingServer")
public class AddExistingServer extends HttpServlet {
 private Connection con = null;
 String dbUrl = "conf/dataintegrationDB.db";
 String url = "jdbc:sqlite:" + dbUrl;
 @Override
 public void doPost(HttpServletRequest request,
  HttpServletResponse response) throws IOException {
  String action = request.getParameter("action").trim();
  String serverName = request.getParameter("serverName").trim();
  PreparedStatement statement;
  try {
   con = DriverManager.getConnection(url);
   con.setAutoCommit(false);
  } catch (SQLException ex) {
   Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
  }
  switch (action) {
   case "Delete": //delete entry from server details 
    try {
     statement = con.prepareStatement("DELETE FROM serverdetails WHERE servername = '" + serverName + "';");
     statement.executeUpdate();
     statement.close();
     con.commit();
     con.close();
    } catch (SQLException ex) {
     Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
    }
    break;
   case "Update": //Update server details added
    try {
     String hostName = request.getParameter("hostName").trim();
     String portNumber = request.getParameter("portNumber").trim();
     String primaryKey = request.getParameter("primaryKey").trim();
     String isSecured=request.getParameter("issecured").trim();
     String updatedValues = request.getParameter("updatedValues").trim();
     String[] changedValues = updatedValues.split(",");
     for (int i = 0; i < changedValues.length; i++) {
         if(!(changedValues[i]).equals("")){
            Statement stmt = con.createStatement();
            String value = request.getParameter(changedValues[i]).trim();
            String query1 = "update serverdetails set'" + changedValues[i] + "' = '" + value + "' WHERE servername= '" + primaryKey + "';";
            stmt.execute(query1);
            stmt.close();
            con.commit();
         }
     };
     con.close();
    } catch (SQLException ex) {
     Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
    }
    break;
   default: //Add entry in server details
    try {
     String hostName = request.getParameter("hostName").trim();
     String portNumber = request.getParameter("portNumber").trim();
     String isSecured=request.getParameter("issecured").trim();
     String checkDataExists = "select * from serverdetails where servername like '" + serverName + "'";
     statement = con.prepareStatement(checkDataExists);
     ResultSet result = statement.executeQuery();
     if (!result.next()) {
      statement = con.prepareStatement(
       "INSERT INTO serverdetails (servername,hostname,portnumber,issecured) VALUES(?,?,?,?)");
      statement.setString(1, serverName);
      statement.setString(2, hostName);
      statement.setString(3, portNumber);
      statement.setString(4, isSecured);
      statement.executeUpdate();
      statement.close();
      con.commit();
     } else {
      response.setContentType("text/html");
      PrintWriter out = response.getWriter();
      out.print("Given Server Name already Exists");
      out.close();

     }
     con.close();
    } catch (SQLException ex) {
     Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
    }
    break;
  }
 }

 /**
  *
  * @param request
  * @param response
  * @throws SQLException
  */
 public void doGet(HttpServletRequest request,
     HttpServletResponse response) throws IOException {
     response.setContentType("text/html");
     PrintWriter out = response.getWriter();
     String dbUrl = "conf/dataintegrationDB.db";
     Statement query = null;
     try {
         Class.forName("org.sqlite.JDBC");
     } catch (ClassNotFoundException ex) {
         Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
     }
     String url = "jdbc:sqlite:" + dbUrl;
     try {
         con = DriverManager.getConnection(url);
     } catch (SQLException ex) {
         Logger.getLogger(AddExistingServer.class.getName()).log(Level.SEVERE, null, ex);
     }
     if (con != null) {
         try {
             query = con.createStatement();
             String sql = "select * from serverdetails";
             ResultSet result = query.executeQuery(sql);

             while (result.next()) {
                 String hostName = result.getString("hostname");
                 out.print(hostName + ":");
                 String portNumber = result.getString("portnumber");
                 String serverName = result.getString("servername");
                 String isSecured = result.getString("issecured");
                 out.print(serverName + "::");
                 out.print(portNumber + ":");
                 out.print(isSecured + ",");
             }
             out.close();
             result.close();
         } catch (SQLException ex) {
             out.print(ex);
         }
     }
 }
}