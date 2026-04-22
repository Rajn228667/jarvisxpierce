; =====================================================================
; Pierce X Hail Mery — Inno Setup installer script
;
; Prereq:
;   1) Run  build.bat  in repo root first. It must produce:
;        release\PierceX.Api.exe
;        release\wwwroot\index.html
;        release\start.bat
;   2) Install Inno Setup 6:  winget install JRSoftware.InnoSetup
;   3) Compile:                iscc installer\PierceX.iss
;   4) Output:                 installer\Output\PierceX-Setup.exe
; =====================================================================

#define MyAppName         "Pierce X Hail Mery"
#define MyAppShortName    "PierceX"
#define MyAppVersion      "1.0.0"
#define MyAppPublisher    "Pierce X"
#define MyAppURL          "https://github.com/Rajn228667/jarvisxpierce"
#define MyAppExeName      "PierceX.Api.exe"
#define MyAppLauncherName "start.bat"

[Setup]
AppId={{7F3A1B7C-9C1E-4B7D-8E13-PIERCEXHAILMERY}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppShortName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=PierceX-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\{#MyAppExeName}
LicenseFile=
SetupLogging=yes

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "autostart"; Description: "Запускать Pierce X при входе в Windows"; GroupDescription: "Автозапуск:"; Flags: unchecked

[Files]
; Backend single-file EXE + runtime files (whatever publish produced)
Source: "..\release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}";            Filename: "{app}\{#MyAppLauncherName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\Swagger API Docs";        Filename: "http://localhost:5080/swagger"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}";      Filename: "{app}\{#MyAppLauncherName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "{#MyAppShortName}"; ValueData: """{app}\{#MyAppLauncherName}"""; Flags: uninsdeletevalue; Tasks: autostart

[Run]
Filename: "{app}\{#MyAppLauncherName}"; Description: "Запустить {#MyAppName}"; Flags: nowait postinstall skipifsilent shellexec

[UninstallDelete]
Type: filesandordirs; Name: "{app}\piercex.db"
Type: filesandordirs; Name: "{app}\logs"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  if not FileExists(ExpandConstant('{src}\..\release\{#MyAppExeName}')) then
  begin
    MsgBox('release\{#MyAppExeName} не найден.' + #13#10 +
           'Сначала запустите build.bat в корне репозитория.', mbError, MB_OK);
    Result := False;
  end;
end;
