node ('DataIntegration') 
{
timestamps { timeout(time: 7200000, unit: 'MILLISECONDS') 
{
    stage 'Checkout' 
        env.PATH = "${userprofile}"+"\\Downloads\\apache-maven-3.5.0-bin\\apache-maven-3.5.0\\bin;${env.PATH}"
        env.JAVA_HOME = "${ProgramFiles}"+"\\Java\\"+env.JDK_VERSION
    try
    {	
	  checkout scm
     }
    catch(Exception e)
    {
        currentBuild.result = 'FAILURE'
    }     
if(currentBuild.result != 'FAILURE')
{ 
	stage 'Build Source'
	try
	{		
	    gitlabCommitStatus("Build")
		{
			bat 'powershell.exe -ExecutionPolicy ByPass -File build/build.ps1 -Script '+env.WORKSPACE+"/build/build.cake -Target build -NugetServerUrl "+env.nugetserverurl
	 	}
                 def files = findFiles(glob: '**/cireports/errorlogs/*.txt')

                 if(files.size() > 0)
                 {
                    currentBuild.result = 'FAILURE'
                  }
    }
	 catch(Exception e) 
    {
		currentBuild.result = 'FAILURE'
    }
}
if(currentBuild.result != 'FAILURE')
{
	stage 'Code violation'
try
{
	    gitlabCommitStatus("Code violation")
	    {
				 bat 'powershell.exe -ExecutionPolicy ByPass -File build/build.ps1 -Script '+env.WORKSPACE+"/build/build.cake -Target codeviolation"  
	    }
}
	catch(Exception e) 
	{
		currentBuild.result = 'FAILURE'
	}
}  

if(currentBuild.result != 'FAILURE')
{ 
	 stage 'Test'
	 try
	 {     
		gitlabCommitStatus("Test")	 
        { 
			bat 'powershell.exe -ExecutionPolicy ByPass -File build/build.ps1 -Script '+env.WORKSPACE+"/build/build.cake -Target test"
        }  
	 }	  
     catch(Exception e) 
    {	 
		currentBuild.result = 'FAILURE'
    }
}

	stage 'Delete Workspace'
	
	// Archiving artifacts when the folder was not empty
	
    def files = findFiles(glob: '**/cireports/**/*.*')      
    
    if(files.size() > 0) 		
    { 		
        archiveArtifacts artifacts: 'cireports/', excludes: null 		
    }
	
	   step([$class: 'WsCleanup']) 	}
}}