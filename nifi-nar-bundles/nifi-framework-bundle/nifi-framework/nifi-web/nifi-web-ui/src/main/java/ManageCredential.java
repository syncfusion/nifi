
/*
 * To change this license header, choose License Headers in Project Properties.
 */
/**
 *
 */
import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ManageCredential")
public class ManageCredential extends HttpServlet{
    
  @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Statement stmt = null;
        Connection con = null;
        Boolean isErrorOccurred = false;
        try {
            Class.forName("org.sqlite.JDBC");
            String url = "jdbc:sqlite:conf/dataintegrationDB.db";
            con = DriverManager.getConnection(url);
            stmt = con.createStatement();
            String userName = request.getParameter("username");
            String password = request.getParameter("password");
            response.setContentType("text/html;charset=UTF-8");
            if ((request.getParameter("type")).equals("changePassword")) {
                String emailId = request.getParameter("mailId");
                String query = "update login set password='" + password + "',emailid='" + emailId + "' where username='" + userName + "'";
                stmt.executeUpdate(query);
            } else {
                String query = "select * from login where username='" + userName + "'";
                ResultSet rs = stmt.executeQuery(query);
                if (rs.next()) {
                    String pswd = rs.getString("password");
                    if (!password.equals(pswd)) {
                        isErrorOccurred = true;
                    }
                }
                else{
                     isErrorOccurred = true;
                }
            }
        } catch (ClassNotFoundException | SQLException ex) {
            isErrorOccurred = true;
            Logger.getLogger(ManageCredential.class.getName()).log(Level.SEVERE, null, ex);
        } finally {
            try {
                if (stmt != null) {
                    stmt.close();
                }
                if (con != null) {
                    con.close();
                }
            } catch (SQLException ex) {
                Logger.getLogger(ManageCredential.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        if (isErrorOccurred) {
            response.getWriter().write("Error occurred");
        } else {
            response.getWriter().write("Success");
        }
    }
}
